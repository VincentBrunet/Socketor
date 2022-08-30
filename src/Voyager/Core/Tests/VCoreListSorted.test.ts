import { assertEquals } from "https://deno.land/std@0.153.0/testing/asserts.ts";
import { VCoreListSorted } from "../VCoreListSorted.ts";

Deno.test({
  name: "VNetBuffer.simpleCasesInt",
  fn: () => {
    const sortedList = new VCoreListSorted<number>((value: number) => {
      return value;
    });
    sortedList.insert(0);
    sortedList.insert(-42);
    sortedList.insert(0);
    sortedList.insert(42);

    assertEquals(sortedList.get(0), -42);
    assertEquals(sortedList.get(1), 0);
    assertEquals(sortedList.get(2), 0);
    assertEquals(sortedList.get(3), 42);

    assertEquals(sortedList.findIndex(-43), 0);
    assertEquals(sortedList.findIndex(-42), 1);
    assertEquals(sortedList.findIndex(-41), 1);
    assertEquals(sortedList.findIndex(0), 3);
    assertEquals(sortedList.findIndex(1), 3);
    assertEquals(sortedList.findIndex(42), 4);
    assertEquals(sortedList.findIndex(43), 4);
  },
});

Deno.test({
  name: "VNetBuffer.simpleCasesString",
  fn: () => {
    const sortedList = new VCoreListSorted<string>((value: string) => {
      return value.length;
    });
    sortedList.insert("abc"); // position 3
    sortedList.insert("-"); // position 1
    sortedList.insert("zzzzz"); // position 5
    sortedList.insert("123"); // position 3

    assertEquals(sortedList.get(0), "-");
    assertEquals(sortedList.get(1), "abc");
    assertEquals(sortedList.get(2), "123");
    assertEquals(sortedList.get(3), "zzzzz");

    assertEquals(sortedList.findIndex(0), 0);
    assertEquals(sortedList.findIndex(1), 1);
    assertEquals(sortedList.findIndex(2), 1);
    assertEquals(sortedList.findIndex(3), 3);
    assertEquals(sortedList.findIndex(4), 3);
    assertEquals(sortedList.findIndex(5), 4);
    assertEquals(sortedList.findIndex(6), 4);
  },
});
