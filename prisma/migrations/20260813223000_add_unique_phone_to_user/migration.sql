-- AlterTable: make User.phone unique (required for phone-number sign-in lookups)
CREATE UNIQUE INDEX "User_phone_key" ON "User"("phone");
