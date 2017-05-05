import ILocationProvider from "./ILocationProvider";

class LocationProvider implements ILocationProvider {

    getLocation(): Location {
        return window.location;
    }
}

export {LocationProvider};