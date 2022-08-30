import { assertEquals } from "https://deno.land/std@0.153.0/testing/asserts.ts";
import { VNetBuffer } from "../VNetBuffer.ts";

Deno.test({
  name: "VNetBuffer.simpleCases",
  fn: () => {
    const buffer = new VNetBuffer(10);

    buffer.writeInt32(42);
    buffer.writeInt32(-42);
    buffer.writeFloat32(1.5);
    buffer.writeFloat32(-1.5);
    buffer.writeString("Simple string");

    buffer.setPosition(0);

    assertEquals(buffer.readInt32(), 42);
    assertEquals(buffer.readInt32(), -42);
    assertEquals(buffer.readFloat32(), 1.5);
    assertEquals(buffer.readFloat32(), -1.5);
    assertEquals(buffer.readString(), "Simple string");
  },
});
