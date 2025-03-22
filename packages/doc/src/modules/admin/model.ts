import {BaseModel, effect} from '@elux/react-web';
import {pathToRegexp} from 'path-to-regexp';
import {APPState, PathPrefix} from '@/Global';
import {MenuData, SubModule} from './entity';

export interface ModuleState {
  subModule?: SubModule;
  dialogMode: boolean;
}
export interface RouteParams {
  subModule?: SubModule;
}

export class Model extends BaseModel<ModuleState, APPState> {
  protected routeParams!: RouteParams;
  protected privateActions = this.getPrivateActions({});
  protected getRouteParams(): RouteParams {
    const {pathname} = this.getRouter().location;
    const [, , subModuleStr = ''] = pathToRegexp('/:admin/:subModule', undefined, {end: false}).exec(pathname.replace(PathPrefix, '')) || [];
    const subModule: SubModule | undefined = SubModule[subModuleStr] || undefined;
    return {subModule};
  }
  public onMount(): void | Promise<void> {
    this.routeParams = this.getRouteParams();
    const {
      location: {classname},
    } = this.getRouter();
    const {subModule} = this.routeParams;
    const dialogMode = classname.startsWith('_');
    const prevState = this.getPrevState();
    const initState: ModuleState = {
      ...prevState,
      subModule,
      dialogMode,
    };
    this.dispatch(this.privateActions._initState(initState));
  }
}
