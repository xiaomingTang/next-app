/**
 * 由于 prisma 暂不支持 NATURAL LANGUAGE MODE, 所以只能执行 raw query.
 * 该 sql 需要执行前置命令:
 * ALTER TABLE `16px`.`Blog` ADD FULLTEXT `fulltext_title_description_content` (`title`, `description`, `content`) WITH PARSER NGRAM;
 */

SELECT
    JSON_OBJECT(
        'id', u.id,
        'name', u.name,
        'role', u.role
    ) AS creator,
    b.hash,
    b.type,
    b.createdAt,
    b.updatedAt,
    b.title,
    -- 不需要查询 content 字段，只需要返回的时候带上这个字段
    "" AS content,
    b.description,
    JSON_ARRAYAGG(
        JSON_OBJECT(
            'name', t.name,
            'hash', t.hash,
            'description', t.description
        )
    ) AS tags
FROM `16px`.`Blog` AS b
JOIN `16px`.`User` AS u
    ON b.creatorId = u.id
LEFT JOIN `16px`.`_BlogToTag` AS bt
    ON b.hash = bt.A
LEFT JOIN `16px`.`Tag` AS t
    ON bt.B = t.hash
WHERE b.type = "PUBLISHED"
  AND MATCH (b.title, b.description, b.content) AGAINST (? IN NATURAL LANGUAGE MODE)
GROUP BY b.hash, b.type, b.createdAt, b.updatedAt, b.title, b.description, u.id, u.name, u.role
LIMIT 5;
