import ILocationProvider from "./ILocationProvider";
import {injectable} from "inversify";

@injectable()
class LocationProvider implements ILocationProvider {

    getLocation(): Location {
        return window.location;
    }
}

export {LocationProvider};