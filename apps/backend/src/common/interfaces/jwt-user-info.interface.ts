export interface IJwtUserInfo {
    id: number,
    email: string,
    isAdmin?: boolean,
}

export interface IAuthenticatedRequest {
    user: IJwtUserInfo;
}
