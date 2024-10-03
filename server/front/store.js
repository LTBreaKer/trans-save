const state = {
    count: 0,
    isAuthenticated: false,
  };
  
  const listeners = [];
  
  function getState() {
    console.log("state:    ", state);
    return state;
  }
  
  function setState(newState) {
    console.log("newstate     ", newState);
    Object.assign(state, newState);
    listeners.forEach(listener => listener(state));
  }
  
  function subscribe(listener) {
    console.log("listener   ", listener);
    listeners.push(listener);
  }
  
  export { getState, setState, subscribe };
  