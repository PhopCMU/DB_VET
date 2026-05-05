export interface IAuthModel {
  authUrlBase: string;
  clientId: string;
  redirectUri: string;
  scope: string;
  responseType: string;
}

export interface TokenResponse {
  token: string;
  token_type: string;
  expires_in: number;
}

export type AccessToken = any;

export interface UserInfo {
  cmuitaccount: string;
  cmuitaccount_name: string;
  firstname_EN: string;
  firstname_TH: string;
  itaccounttype_EN: string;
  itaccounttype_TH: string;
  itaccounttype_id: string;
  lastname_EN: string;
  lastname_TH: string;
  organization_code: string;
  organization_name_EN: string;
  organization_name_TH: string;
  prename_EN: string;
  prename_TH: string;
  prename_id: string;
  [key: string]: unknown;
}

export interface UserInfoGet {
  userId: string;
  cmuitaccount: string;
  cmuitaccount_name: string;
  firstname_EN: string;
  firstname_TH: string;
  itaccounttype_EN: string;
  itaccounttype_TH: string;
  itaccounttype_id: string;
  lastname_EN: string;
  lastname_TH: string;
  organization_code: string;
  organization_name_EN: string;
  organization_name_TH: string;
  prename_EN: string;
  prename_TH: string;
  prename_id: string;
  status_user: string;
  iat: number;
  [key: string]: any;
}
