import { Subject, Subscription, Observable } from 'rxjs';

class Event {
  private _eventPool: Map<string, SingleEvent> = new Map();

  public get eventPool() { return this._eventPool }

  public on<T>(name: string): Observable<T> | null {
    this.add<T>(name);
    return this.get<T>(name)?.subject!;
  }

  public emit<T>(name: string, ...param: T[]): void {
    this.add<T>(name);
    if (param.length > 1) {
      this.get<T>(name)?.subject.next(...param);
    } else {
      this.get<T>(name)?.subject.next(param[0]);
    }
  }

  private add<T>(name: string): SingleEvent<T> {
    if (!this.has(name)) {
      this.eventPool.set(name, new SingleEvent<T>(name));
    }

    return this.get<T>(name);
  }

  private has(name: string) {
    return this.eventPool.has(name);
  }

  public get<T>(name: string): SingleEvent<T> {
    return this.eventPool.get(name)!;
  }
}

class SingleEvent<T = any> {
  private _name: string;
  private _subject: Subject<T>;
  private _subscription: Subscription[];

  public get name() { return this._name };
  public get subject() { return this._subject };
  public get subscription() { return this._subscription };

  public set name(name: string) {
    this._name = name;
  }

  public set subject(sub: Subject<T>) {
    this._subject = sub;
  }
  
  public set subscription(subscription: Subscription[]) {
    this._subscription = subscription;
  }

  constructor(name: string, subject?: Subject<T>, subscription?: Subscription[]) {
    this.name = name;
    this.subject = subject ? subject : new Subject<T>();
    this.subscription = subscription || [];
  }

  static create<T>(name: string, subject: Subject<T>, subscription: Subscription[]) {
    return new SingleEvent<T>(name, subject, subscription);
  }
}

export default new Event();