-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'POWER_USER', 'ADMIN', 'SUPER_ADMIN');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "role" "Role" NOT NULL DEFAULT 'USER',
ALTER COLUMN "password_hash" DROP NOT NULL;
