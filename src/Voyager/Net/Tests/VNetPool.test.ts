import { assertEquals } from "https://deno.land/std@0.153.0/testing/asserts.ts";
import { VNetBuffer } from "../VNetBuffer.ts";
import { VNetPool } from "../VNetPool.ts";

Deno.test({
  name: "VNetPool.simpleCases",
  fn: () => {
    const pool = new VNetPool();

    const buffer100 = new VNetBuffer(100);
    const buffer900 = new VNetBuffer(900);
    const buffer21 = new VNetBuffer(21);

    pool.recycle(buffer100);
    pool.recycle(buffer900);
    pool.recycle(buffer21);

    assertEquals(buffer900, pool.obtain());
    assertEquals(buffer100, pool.obtain());
    assertEquals(buffer21, pool.obtain());
  },
});
