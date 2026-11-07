/** @type {import('next').NextConfig} */
module.exports = {
  // Bulk upload sends an Excel file (max 4 MB, enforced in code) through a server action.
  experimental: { serverActions: { bodySizeLimit: "5mb" }, serverComponentsExternalPackages: ["nodemailer"] },
};
