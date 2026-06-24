# Vulnerability Report: `ViewUserDto`

Date: 2026-06-05

Scope:
- `apps/backend/src/domains/view-models/user/view.user.dto.ts`
- Related usage in comments and user endpoints

## Summary

`ViewUserDto` is used as a public response model but exposes fields that may be private or unnecessary in public contexts. The main risk is user data disclosure through endpoints that embed user data, especially recipe comments.

## Findings

### 1. User email disclosure

Severity: Medium

Location:
- `apps/backend/src/domains/view-models/user/view.user.dto.ts:13`
- `apps/backend/src/domains/view-models/comment/view.comment.dto.ts:26`
- `apps/backend/src/controllers/comment.controller.ts:25`

`ViewUserDto` exposes `email`. The same DTO is embedded as `author` in `ViewCommentDto`, so comment endpoints can return author emails to any authenticated user who can read recipe comments.

Impact:
- Email harvesting from comment authors.
- Privacy leak if email is intended only for account ownership/authentication.
- Increased phishing or spam risk.

Recommendation:
- Split user response DTOs by context.
- Use a public DTO for embedded authors, for example `PublicUserDto`, containing only `id`, `name`, and optionally avatar/profile display fields.
- Keep `email` only in a private/self DTO, for example `PrivateUserDto` or `CurrentUserDto`.

Example target shape:

```ts
export class PublicUserDto extends AbstractDto {
    @Expose()
    name: string;
}
```

Then update `ViewCommentDto.author` to use `PublicUserDto`, not `ViewUserDto`.

### 2. Potential exposure of profile fields in unintended contexts

Severity: Low to Medium

Location:
- `apps/backend/src/domains/view-models/user/view.user.dto.ts:17`
- `apps/backend/src/domains/view-models/user/view.user.dto.ts:21`

`bio` and `social` are exposed everywhere `ViewUserDto` is used. These fields may be safe for a profile page but should not automatically appear in every embedded user response.

Impact:
- Unnecessary user profiling data can leak through unrelated endpoints.
- Future profile fields added to this DTO may become public accidentally.

Recommendation:
- Keep public profile fields in a dedicated profile DTO.
- Keep embedded author DTOs minimal.
- Do not reuse a broad user DTO for comments, lists, and private account responses.

### 3. Technical metadata exposure through `AbstractDto`

Severity: Low

Location:
- `apps/backend/src/domains/view-models/__abstract.dto.ts:11`
- `apps/backend/src/domains/view-models/__abstract.dto.ts:15`
- `apps/backend/src/domains/view-models/__abstract.dto.ts:19`
- inherited by `apps/backend/src/domains/view-models/user/view.user.dto.ts:8`

`ViewUserDto` inherits `createdAt`, `updatedAt`, and `deletedAt`. This may be acceptable for admin/internal views, but it is usually unnecessary in public embedded user objects.

Impact:
- Reveals account creation/update timing.
- Exposes soft-delete state if accidentally returned.
- Adds avoidable metadata to public API responses.

Recommendation:
- Avoid inheriting `AbstractDto` for public embedded user DTOs if those timestamps are not required.
- Create a smaller DTO for public user references.

### 4. DTO is reused across contexts with different privacy requirements

Severity: Medium

Location:
- `apps/backend/src/controllers/user.controller.ts:36`
- `apps/backend/src/domains/view-models/comment/view.comment.dto.ts:26`

The same `ViewUserDto` is used for direct user reads and embedded comment authors. These contexts have different privacy requirements. A direct `/user/:id` response, a current-account response, and a comment author response should not necessarily expose the same fields.

Impact:
- A field added later to `ViewUserDto` can leak through comment responses.
- Privacy rules become implicit and hard to audit.

Recommendation:
- Introduce separate DTOs:
  - `PublicUserDto` for embedded author/user references.
  - `UserProfileDto` for public profile pages.
  - `PrivateUserDto` or `CurrentUserDto` for the authenticated user's own account details.
- Update controllers/services to choose DTOs by endpoint purpose.

## Suggested Remediation Plan

1. Create `PublicUserDto` with only safe public fields.
2. Replace `ViewCommentDto.author: ViewUserDto` with `PublicUserDto`.
3. Review `/user/:id` and `/user/collection` to decide whether email should be public.
4. If email is private, remove `email` from public DTOs and expose it only through a current-user endpoint.
5. Add tests asserting that comment responses do not include `author.email`.

## Notes

`@Exclude()` and `@Expose()` are used correctly to avoid accidental exposure of non-exposed fields. The issue is not class-transformer configuration; the issue is that sensitive or context-specific fields are explicitly exposed in a DTO reused across public response paths.
