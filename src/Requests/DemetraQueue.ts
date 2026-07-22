import { type AnyDemetraRequest } from './index.ts';

class DemetraQueue {
  public readonly requests: AnyDemetraRequest[] = [];

  public add(request: AnyDemetraRequest): void {
    this.requests.push(request);
  }

  public clear(): void {
    this.requests.length = 0;
  }
}

export default DemetraQueue;
