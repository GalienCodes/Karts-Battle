class Connect {
  constructor(log=false) {
    this.handlers = {};
    this.log = log;
  }

  addHandler(id, handler) {
    this.handlers[id] = handler;
  }

  /**
   * Handler obj will of form:
   * {
   *    connect: (data) => { processData(data) ... },
   *    disconnect: (data) => { processData(data) ... }
   * }
   * @param {*} handlerObj 
   */
  addHandlers(handlerObj) {
    Object.assign(this.handlers, handlerObj);
  }

  msg(id, data) {
    if(this.log) {
      console.log('send', data);
    }

    if(this.handlers[id]) {
      setTimeout(() => {
        if(this.log) {
          console.log('sending', data);
        }
        this.handlers[id](data);
      }, 1);
    }
  }
}

const connect = new Connect();

export default connect;