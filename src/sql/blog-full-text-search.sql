/**
 * 由于 prisma 暂不支持 NATURAL LANGUAGE MODE, 所以只能执行 raw query.
 * 该 sql 需要执行前置命令:
 * ALTER TABLE `tytcn`.`Blog` ADD FULLTEXT `fulltext_title_description_content` (`title`, `description`, `content`) WITH PARSER NGRAM;
 */

SELECT
    `tytcn`.`Blog`.`hash`,
    `tytcn`.`Blog`.`type`,
    `tytcn`.`Blog`.`createdAt`,
    `tytcn`.`Blog`.`updatedAt`,
    `tytcn`.`Blog`.`title`,
    `tytcn`.`Blog`.`content`,
    `tytcn`.`Blog`.`description`,
    `tytcn`.`Blog`.`creatorId`
FROM `tytcn`.`Blog`
WHERE (
        `tytcn`.`Blog`.`type` = "PUBLISHED"
        AND MATCH (
            `tytcn`.`Blog`.`title`,
            `tytcn`.`Blog`.`description`,
            `tytcn`.`Blog`.`content`
        ) AGAINST (? IN NATURAL LANGUAGE MODE)
    )
LIMIT 5