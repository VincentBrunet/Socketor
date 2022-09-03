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

    assertEquals(sortedList.findIndexBeforePosition(-43), 0);
    assertEquals(sortedList.findIndexBeforePosition(-42), 0);
    assertEquals(sortedList.findIndexBeforePosition(-41), 1);
    assertEquals(sortedList.findIndexBeforePosition(0), 1);
    assertEquals(sortedList.findIndexBeforePosition(1), 3);
    assertEquals(sortedList.findIndexBeforePosition(42), 3);
    assertEquals(sortedList.findIndexBeforePosition(43), 4);

    assertEquals(sortedList.findIndexAfterPosition(-43), 0);
    assertEquals(sortedList.findIndexAfterPosition(-42), 1);
    assertEquals(sortedList.findIndexAfterPosition(-41), 1);
    assertEquals(sortedList.findIndexAfterPosition(0), 3);
    assertEquals(sortedList.findIndexAfterPosition(1), 3);
    assertEquals(sortedList.findIndexAfterPosition(42), 4);
    assertEquals(sortedList.findIndexAfterPosition(43), 4);

    assertEquals(-1, sortedList.indexOf(-43));
    assertEquals(0, sortedList.indexOf(-42));
    assertEquals(-1, sortedList.indexOf(-41));
    assertEquals(1, sortedList.indexOf(0));
    assertEquals(-1, sortedList.indexOf(1));
    assertEquals(3, sortedList.indexOf(42));
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

    assertEquals(sortedList.findIndexBeforePosition(0), 0);
    assertEquals(sortedList.findIndexBeforePosition(1), 0);
    assertEquals(sortedList.findIndexBeforePosition(2), 1);
    assertEquals(sortedList.findIndexBeforePosition(3), 1);
    assertEquals(sortedList.findIndexBeforePosition(4), 3);
    assertEquals(sortedList.findIndexBeforePosition(5), 3);
    assertEquals(sortedList.findIndexBeforePosition(6), 4);

    assertEquals(sortedList.findIndexAfterPosition(0), 0);
    assertEquals(sortedList.findIndexAfterPosition(1), 1);
    assertEquals(sortedList.findIndexAfterPosition(2), 1);
    assertEquals(sortedList.findIndexAfterPosition(3), 3);
    assertEquals(sortedList.findIndexAfterPosition(4), 3);
    assertEquals(sortedList.findIndexAfterPosition(5), 4);
    assertEquals(sortedList.findIndexAfterPosition(6), 4);

    assertEquals(-1, sortedList.indexOf(""));
    assertEquals(0, sortedList.indexOf("-"));
    assertEquals(-1, sortedList.indexOf("j"));
    assertEquals(1, sortedList.indexOf("abc"));
    assertEquals(-1, sortedList.indexOf("aaa"));
    assertEquals(2, sortedList.indexOf("123"));
    assertEquals(-1, sortedList.indexOf("000"));
    assertEquals(3, sortedList.indexOf("zzzzz"));
    assertEquals(-1, sortedList.indexOf("?????"));
  },
});
