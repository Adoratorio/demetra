import DemetraRequest from "./DemetraRequest";

class DemetraQueue {
  private readonly requests : Array<DemetraRequest> = [];

  constructor() {}

  add(request : DemetraRequest) {
    this.requests.push(request);
  }

  clear() {
    this.requests.length = 0;
  }
}

export default DemetraQueue;
