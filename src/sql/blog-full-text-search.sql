/**
 * 由于 prisma 暂不支持 NATURAL LANGUAGE MODE, 所以只能执行 raw query.
 * 该 sql 需要执行前置命令:
 * ALTER TABLE `tytcn-nest`.`Blog` ADD FULLTEXT `fulltext_title_description_content` (`title`, `description`, `content`) WITH PARSER NGRAM;
 */

SELECT
    `tytcn-nest`.`Blog`.`hash`,
    `tytcn-nest`.`Blog`.`type`,
    `tytcn-nest`.`Blog`.`createdAt`,
    `tytcn-nest`.`Blog`.`updatedAt`,
    `tytcn-nest`.`Blog`.`title`,
    `tytcn-nest`.`Blog`.`content`,
    `tytcn-nest`.`Blog`.`description`,
    `tytcn-nest`.`Blog`.`creatorId`
FROM `tytcn-nest`.`Blog`
WHERE (
        `tytcn-nest`.`Blog`.`type` = "PUBLISHED"
        AND MATCH (
            `tytcn-nest`.`Blog`.`title`,
            `tytcn-nest`.`Blog`.`description`,
            `tytcn-nest`.`Blog`.`content`
        ) AGAINST (? IN NATURAL LANGUAGE MODE)
    )
LIMIT 5