import {ViewModelContext} from "ninjagoat";

interface IContextProvider {
    getContext(): ViewModelContext;
}

export default IContextProvider;