import { random } from "lodash";

export class Picker<T> {
  constructor(private data: T[]) {}

  random() {
    return this.data[random(this.data.length, false)];
  }
}