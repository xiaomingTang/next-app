import type { Role } from '@/generated-prisma-client'

export const InfiniteTimeout = 2 ** 31 - 1
export const DEFAULT_BLUR_DATA_URL =
  'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAMAAABEpIrGAAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAABelBMVEUAAAAAAAAEBAQFBQUEBAQDAwMEBAQEBAQEBAQFBQUEBAQEBAQAAAAAAAAEBAQEBAQEBAQEBAQAAAAFBQUFBQUEBAQAAAAFBQUEBAQAAAAAAAADAwMDAwMEBAQAAAAEBAQFBQUEBAQGBgYEBAQAAAAEBAQEBAREBQ6EBBeKAxhXBBEXBAgEBAQKAwUFBAQEBAT/ADP6BSzcBCZPBA8FBARrBBR2BBcFBQX8AyviBCYxAwsEBARzBBXjBCj/AC77BCuhBB4FBAR4BBf4BCsAAAD8AyzWBSUIAwV+BBjfBCYEBAT/ACf8AyzZAyQGBASOBBmbBBv8AyyDAxjeAyY1AwsFBQX3ACjrBCkDAwMAAAD7BCtOBBAGBgb8AyzLBCQEBAT4CC37BCv7BCv7BCvpBCcKAwUEBAQGBgb/ACT/ACf/AAD7BCuFAxc0AwtLBA9tAxQAAAD7BCv/ACv/ADP7BCv7BCv6BSv7BCv7BCz6BSz8AysEBAT7BCv///9aiyzaAAAAe3RSTlMABzlwjJmw7vngtnUYE4vx94kGN+LGDTLwAQnbXdcZeTasKcUC6Nhxxby+yfzb8s0FaeW49L2+qV/rvP6+5wvjxuq/+CBS2N3B5LQNmOLswsVMw9+/oSDt3xDLuy5d1u0i9fTE69zQKA4aAu68vr+aBeYMD9K9pZB7Yk3ZuAjdAAAAAWJLR0R9prEQyQAAAAlwSFlzAAABLgAAAS4Be3EaTQAAAAd0SU1FB+YLFBANBAqHusIAAAEkSURBVDjLzZJXW8IwFEBjcYIDN27EvfcCRUXFgXvvgXuLA9B7f7xto81tCa9+npc8nPPdJG0Y+0tSFFtqWnpGZpbdkS3RObl5YODML7D6wiIwUVxi9qUusGAvo768AhKopIEj0UMVHSEZAKAIXy3zUCMCtzSoFYFHGtSJoL5BFjSSQzY1t7S2tf+Ijk6+dpGguwcRe/v6dTEwyIMh+iGGUWPE61PF6BgPbMT7x5EzMQkQmNK9b5oEM/hLcBbm5vVgge4QWjSKpeWVVX2AQgO2ZgS4vrGpBVvm370tAtzRrrm7Zw78+yI4UL3r0Pqijgx/7AQ4UayenZ5h+FzzF5cAV9eSR3tze8fu1eDh8en5hSUhwjcJvybxb5H3j2gs/vkVYv+Lb1fOvypol+FdAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDIyLTExLTIwVDE2OjEzOjA0KzAwOjAwp2n60AAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyMi0xMS0yMFQxNjoxMzowNCswMDowMNY0QmwAAAAZdEVYdFNvZnR3YXJlAHd3dy5pbmtzY2FwZS5vcmeb7jwaAAAAV3pUWHRSYXcgcHJvZmlsZSB0eXBlIGlwdGMAAHic4/IMCHFWKCjKT8vMSeVSAAMjCy5jCxMjE0uTFAMTIESANMNkAyOzVCDL2NTIxMzEHMQHy4BIoEouAOoXEXTyQjWVAAAAAElFTkSuQmCC'

export const RoleNameMap: Record<Role, string> = {
  ADMIN: '管理员',
  USER: '普通用户',
}

/**
 * 3 - 7 的乱序数组, 长度为 50
 */
export const shuffledArray7 = [
  4, 4, 7, 5, 7, 6, 7, 4, 6, 3, 3, 3, 5, 6, 4, 4, 6, 5, 4, 5, 6, 6, 7, 3, 4, 5,
  7, 6, 6, 6, 6, 4, 5, 4, 5, 6, 7, 6, 5, 4, 7, 7, 5, 3, 5, 4, 3, 6, 5, 4,
]

/**
 * 1 - 10 的乱序数组, 长度为 50
 */
export const shuffledArray10 = [
  2, 6, 5, 4, 4, 6, 3, 9, 8, 10, 6, 1, 7, 9, 10, 2, 6, 3, 4, 1, 6, 3, 1, 5, 1,
  9, 3, 3, 7, 3, 10, 6, 3, 3, 5, 4, 7, 7, 3, 3, 8, 10, 9, 1, 8, 4, 4, 3, 8, 9,
]
