# ninjagoat-testing

Ninjagoat module to mock data and commands responses.

## Installation
```
$ npm install ninjagoat-testing
```

Register the module with [Ninjagoat](https://github.com/tierratelematics/ninjagoat)

```typescript
//bootstrapper.ts
import { TestModule } from "ninjagoat-testing";

application.register(new TestModule());
```

## Usage

In your module/application register your mocked data using [InversifyJS](https://github.com/inversify/InversifyJS)

```typescript
container.bind<any>("Models").toConstantValue(mockedData);
```

`mockedData` must be a dictionary with the following structure (using [Ninjagoat](https://github.com/tierratelematics/ninjagoat) context convention for areas and viewmodel ids)

```
<area>
  └ <viewmodelid>
     └ default -> data
     └ <command> -> data
     └ ...
 <area>
   └ <viewmodelid>
      └ default -> data
      └ <command> -> data
      └ ...
  <...>
```

where:
* `default` is the first mock retrieved when entering the page
* `<command>` is the mock that represents changes in the model due to the handling of a command named `<command>`

Then, you need to register the [Ninjagoat](https://github.com/tierratelematics/ninjagoat) contexts for which you need the mocked data:

```typescript
let contextRegistry = serviceLocator.get<IContextRegistry>("IContextRegistry");

contextRegistry
    .register(new ViewModelContext("area", "viewmodelid1"))
    .register(new ViewModelContext("area", "viewmodelid2"));
```

And it's done. From now on your registered viewmodels will receive the data contained in `mockedData` for the corresponding contexts.

## License

Copyright 2016 Tierra SpA

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

[http://www.apache.org/licenses/LICENSE-2.0](http://www.apache.org/licenses/LICENSE-2.0)

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
