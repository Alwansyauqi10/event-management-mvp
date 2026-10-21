import app from "./app.js";
import { startCheckoutExpiryCron } from "./services/checkout-expiry.service.js";

const PORT = 8000;

startCheckoutExpiryCron();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
