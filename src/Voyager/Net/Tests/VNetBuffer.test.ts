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

Deno.test({
  name: "VNetBuffer.simpleCases",
  fn: () => {
    const buffer = new VNetBuffer(0);

    buffer.getMemory(0, 0);
    assertEquals(buffer.getCapacity() >= 0, true);
    buffer.getMemory(0, 1);
    assertEquals(buffer.getCapacity() >= 1, true);

    buffer.getMemory(0, 2);
    assertEquals(buffer.getCapacity() >= 2, true);
    buffer.getMemory(0, 3);
    assertEquals(buffer.getCapacity() >= 3, true);

    buffer.getMemory(0, 4);
    assertEquals(buffer.getCapacity() >= 4, true);
    buffer.getMemory(0, 5);
    assertEquals(buffer.getCapacity() >= 5, true);

    buffer.getMemory(0, 8);
    assertEquals(buffer.getCapacity() >= 8, true);
    buffer.getMemory(0, 9);
    assertEquals(buffer.getCapacity() >= 9, true);

    buffer.getMemory(0, 10000);
    assertEquals(buffer.getCapacity() >= 10000, true);
  },
});
