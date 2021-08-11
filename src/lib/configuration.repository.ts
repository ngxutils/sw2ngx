import { BehaviorSubject } from 'rxjs';
import { singleton } from 'tsyringe';

@singleton()
export class ConfigurationRepository {
  public config = new BehaviorSubject<Sw2NgxConfig | null>(null);
}
