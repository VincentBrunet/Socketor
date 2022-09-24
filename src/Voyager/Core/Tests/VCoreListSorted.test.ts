import { assertEquals } from "https://deno.land/std@0.153.0/testing/asserts.ts";
import { VCoreListSorted } from "../VCoreListSorted.ts";

Deno.test({
  name: "VNetBuffer.simpleCasesInt",
  fn: () => {
    const sortedList = new VCoreListSorted<number>((value: number) => {
      return value;
    });
    sortedList.insertValue(0);
    sortedList.insertValue(-42);
    sortedList.insertValue(0);
    sortedList.insertValue(42);

    assertEquals(sortedList.getValueAtIndex(0), -42);
    assertEquals(sortedList.getValueAtIndex(1), 0);
    assertEquals(sortedList.getValueAtIndex(2), 0);
    assertEquals(sortedList.getValueAtIndex(3), 42);

    assertEquals(sortedList.findIndexBeforePriority(-43), 0);
    assertEquals(sortedList.findIndexBeforePriority(-42), 0);
    assertEquals(sortedList.findIndexBeforePriority(-41), 1);
    assertEquals(sortedList.findIndexBeforePriority(0), 1);
    assertEquals(sortedList.findIndexBeforePriority(1), 3);
    assertEquals(sortedList.findIndexBeforePriority(42), 3);
    assertEquals(sortedList.findIndexBeforePriority(43), 4);

    assertEquals(sortedList.findIndexAfterPriority(-43), 0);
    assertEquals(sortedList.findIndexAfterPriority(-42), 1);
    assertEquals(sortedList.findIndexAfterPriority(-41), 1);
    assertEquals(sortedList.findIndexAfterPriority(0), 3);
    assertEquals(sortedList.findIndexAfterPriority(1), 3);
    assertEquals(sortedList.findIndexAfterPriority(42), 4);
    assertEquals(sortedList.findIndexAfterPriority(43), 4);

    assertEquals(-1, sortedList.findIndexOfValue(-43));
    assertEquals(0, sortedList.findIndexOfValue(-42));
    assertEquals(-1, sortedList.findIndexOfValue(-41));
    assertEquals(1, sortedList.findIndexOfValue(0));
    assertEquals(-1, sortedList.findIndexOfValue(1));
    assertEquals(3, sortedList.findIndexOfValue(42));
  },
});

Deno.test({
  name: "VNetBuffer.simpleCasesString",
  fn: () => {
    const sortedList = new VCoreListSorted<string>((value: string) => {
      return value.length;
    });
    sortedList.insertValue("abc"); // position 3
    sortedList.insertValue("-"); // position 1
    sortedList.insertValue("zzzzz"); // position 5
    sortedList.insertValue("123"); // position 3

    assertEquals(sortedList.getValueAtIndex(0), "-");
    assertEquals(sortedList.getValueAtIndex(1), "abc");
    assertEquals(sortedList.getValueAtIndex(2), "123");
    assertEquals(sortedList.getValueAtIndex(3), "zzzzz");

    assertEquals(sortedList.findIndexBeforePriority(0), 0);
    assertEquals(sortedList.findIndexBeforePriority(1), 0);
    assertEquals(sortedList.findIndexBeforePriority(2), 1);
    assertEquals(sortedList.findIndexBeforePriority(3), 1);
    assertEquals(sortedList.findIndexBeforePriority(4), 3);
    assertEquals(sortedList.findIndexBeforePriority(5), 3);
    assertEquals(sortedList.findIndexBeforePriority(6), 4);

    assertEquals(sortedList.findIndexAfterPriority(0), 0);
    assertEquals(sortedList.findIndexAfterPriority(1), 1);
    assertEquals(sortedList.findIndexAfterPriority(2), 1);
    assertEquals(sortedList.findIndexAfterPriority(3), 3);
    assertEquals(sortedList.findIndexAfterPriority(4), 3);
    assertEquals(sortedList.findIndexAfterPriority(5), 4);
    assertEquals(sortedList.findIndexAfterPriority(6), 4);

    assertEquals(-1, sortedList.findIndexOfValue(""));
    assertEquals(0, sortedList.findIndexOfValue("-"));
    assertEquals(-1, sortedList.findIndexOfValue("j"));
    assertEquals(1, sortedList.findIndexOfValue("abc"));
    assertEquals(-1, sortedList.findIndexOfValue("aaa"));
    assertEquals(2, sortedList.findIndexOfValue("123"));
    assertEquals(-1, sortedList.findIndexOfValue("000"));
    assertEquals(3, sortedList.findIndexOfValue("zzzzz"));
    assertEquals(-1, sortedList.findIndexOfValue("?????"));
  },
});
