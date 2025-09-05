import QRCode from "qrcode";

// Function to generate QR Code and return it as a data URL
export const generateQRCodeDataUrl = async (text, size = 512) => {
  try {
    // If the input is an object, stringify it
    if (typeof text !== "string") {
      text = JSON.stringify(text);
    }

    // Generate QR code as a data URL
    const qrCodeDataUrl = await QRCode.toDataURL(text, {
      width: size, // Set the width of the QR code (default: 256px)
      margin: 2, // Set margin around the QR code (default: 4px)
    });

    return qrCodeDataUrl; // Return the data URL for use in the React component
  } catch (error) {
    console.error("Error generating QR Code: ", error);
    return ""; // Return an empty string on error
  }
};
