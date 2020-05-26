import { VerifiedSession } from '../../../../../store/src/actions/auth.actions';
import { EndpointActionComplete } from '../../../../../store/src/actions/endpoint.actions';
import { SessionUser } from '../../../../../store/src/types/auth.types';
import { EndpointUser, INewlyConnectedEndpointInfo } from '../../../../../store/src/types/endpoint.types';
import { CfScopeStrings } from '../../../user-permissions/cf-user-permissions-checkers';
import { IAllCfRolesState, ICfRolesState, IGlobalRolesState } from '../../types/cf-current-user-roles.types';
import { getDefaultEndpointRoles } from './current-user-base-cf-role.reducer';

// TODO: RC used
interface PartialEndpoint {
  user: EndpointUser | SessionUser;
  guid: string;
}

export function roleInfoFromSessionReducer(
  state: IAllCfRolesState,
  action: VerifiedSession
): IAllCfRolesState {
  const { endpoints } = action.sessionData;
  return propagateEndpointsAdminPermissions(state, Object.values(endpoints.cf));
}

export function updateNewlyConnectedEndpoint(
  state: IAllCfRolesState,
  action: EndpointActionComplete
): IAllCfRolesState {
  // TODO: RC have at start
  if (action.endpointType !== 'cf') {
    return state;
  }
  const endpoint = action.endpoint as INewlyConnectedEndpointInfo;
  const cfRoles = propagateEndpointsAdminPermissions(state, [{
    user: endpoint.user,
    guid: action.guid
  }]);
  return {
    ...cfRoles,
  };
}


function propagateEndpointsAdminPermissions(
  cfState: IAllCfRolesState,
  endpoints: PartialEndpoint[]
): IAllCfRolesState {
  return Object.values(endpoints).reduce((state, endpoint) => {
    return {
      ...state,
      [endpoint.guid]: propagateEndpointAdminPermissions(state[endpoint.guid], endpoint)
    };
  }, { ...cfState });
}

function propagateEndpointAdminPermissions(state: ICfRolesState = getDefaultEndpointRoles(), endpoint: PartialEndpoint) {
  const scopes = endpoint.user ? endpoint.user.scopes : [];
  const global = getEndpointRoles(scopes, state.global);
  return {
    ...state,
    global
  };
}

function getEndpointRoles(scopes: string[], globalEndpointState: IGlobalRolesState) {
  const newEndpointState = {
    ...globalEndpointState,
    scopes
  };
  return scopes.reduce((roles, scope) => {
    if (scope === CfScopeStrings.CF_ADMIN_GROUP) {
      roles.isAdmin = true;
    }
    if (scope === CfScopeStrings.CF_READ_ONLY_ADMIN_GROUP) {
      roles.isReadOnlyAdmin = true;
    }
    if (scope === CfScopeStrings.CF_ADMIN_GLOBAL_AUDITOR_GROUP) {
      roles.isGlobalAuditor = true;
    }
    if (scope === CfScopeStrings.CF_READ_SCOPE) {
      roles.canRead = true;
    }
    if (scope === CfScopeStrings.CF_WRITE_SCOPE) {
      roles.canWrite = true;
    }
    return roles;
  }, newEndpointState);
}

