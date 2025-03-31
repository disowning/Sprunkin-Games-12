/*
  Warnings:

  - You are about to drop the column `emailVerified` on the `user` table. All the data in the column will be lost.
  - You are about to drop the column `image` on the `user` table. All the data in the column will be lost.
  - Made the column `name` on table `user` required. This step will fail if there are existing NULL values in that column.
  - Made the column `password` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- DropIndex
DROP INDEX `Tag_name_key` ON `tag`;

-- AlterTable
ALTER TABLE `game` MODIFY `description` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `user` DROP COLUMN `emailVerified`,
    DROP COLUMN `image`,
    MODIFY `name` VARCHAR(191) NOT NULL,
    MODIFY `password` VARCHAR(191) NOT NULL;

-- RenameIndex
ALTER TABLE `_gametotag` RENAME INDEX `_GameToTag_AB_unique` TO `_gametotag_AB_unique`;

-- RenameIndex
ALTER TABLE `_gametotag` RENAME INDEX `_GameToTag_B_index` TO `_gametotag_B_index`;

-- RenameIndex
ALTER TABLE `_userfavorites` RENAME INDEX `_UserFavorites_AB_unique` TO `_userfavorites_AB_unique`;

-- RenameIndex
ALTER TABLE `_userfavorites` RENAME INDEX `_UserFavorites_B_index` TO `_userfavorites_B_index`;

-- RenameIndex
ALTER TABLE `tag` RENAME INDEX `Tag_slug_key` TO `tag_slug_key`;

-- RenameIndex
ALTER TABLE `user` RENAME INDEX `User_email_key` TO `user_email_key`;
