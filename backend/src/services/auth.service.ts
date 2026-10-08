import argon from "argon2";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { ApiError } from "../utils/api-error.js";
import {
  ChangePasswordSchema,
  LoginSchema,
  RegisterSchema,
  UpdateProfileSchema,
} from "../validator/auth.validator.js";

export const registerService = async (body: RegisterSchema) => {
  //1. cek email udah kepake atau belum
  const user = await prisma.user.findUnique({
    where: { email: body.email },
  });
  //2.kalo udah kepake throw error
  if (user) {
    throw new ApiError("Email sudah terdaftar", 400);
  }
  //3.kalo belum hash passwordnya
  const hashedPassword = await argon.hash(body.password);

  // 4. Buat referral code
  const referralCode = `REF-${Date.now()}`;
  //5. create data usernya
  await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      password: hashedPassword,
      phone: body.phone,
      referralCode,
    },
  });

  //6. return success
  return { message: "register success!" };
};

export const loginService = async (body: LoginSchema) => {
  //1. cek dulu email di db ada atau tidak
  const user = await prisma.user.findUnique({
    where: { email: body.email },
  });
  //2. kalau email tidak ada throw error
  if (!user) {
    throw new ApiError("Email atau password salah", 401);
  }
  //3. cek passwordnya ada atau tidak
  const isPassMatch = await argon.verify(user.password, body.password);

  //4. kalo password salah throw error
  if (!isPassMatch) {
    throw new ApiError("Email atau password salah", 401);
  }

  //5. generate access token (jwt)
  const payload = { id: user.id.toString(), role: user.role };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET!, {
    expiresIn: "1d",
  });

  //6.return message login success : data user + access token
  return {
    message: "Login success",
    accessToken,
    user: {
      id: user.id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
      profilePic: user.profilePicture,
    },
  };
};

export const profileService = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: {
      id: BigInt(userId),
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      profilePicture: true,
      referralCode: true,
    },
  });
  return user;
};
export const updateProfileService = async (
  userId: string,
  body: UpdateProfileSchema,
) => {
  const user = await prisma.user.update({
    where: {
      id: BigInt(userId),
    },
    data: {
      name: body.name,
      phone: body.phone,
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      phone: true,
      profilePicture: true,
      referralCode: true,
    },
  });

  return user;
};

export const changePasswordService = async (
  userId: string,
  body: ChangePasswordSchema,
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: BigInt(userId),
    },
  });

  if (!user) {
    throw new ApiError("User tidak ditemukan", 404);
  }

  const isPasswordMatch = await argon.verify(
    user.password,
    body.currentPassword,
  );

  if (!isPasswordMatch) {
    throw new ApiError("Password lama salah", 400);
  }
  const isSamePassword = await argon.verify(user.password, body.newPassword);

  if (isSamePassword) {
    throw new ApiError(
      "Password baru tidak boleh sama dengan password lama",
      400,
    );
  }

  const hashedPassword = await argon.hash(body.newPassword);

  await prisma.user.update({
    where: {
      id: BigInt(userId),
    },
    data: {
      password: hashedPassword,
    },
  });

  return {
    message: "Password berhasil diubah",
  };
};
