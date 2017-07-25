package com.huawei.openview.devops.util;

import java.util.concurrent.ThreadLocalRandom;
import java.util.NavigableMap;
import java.util.Map;
import java.util.TreeMap;

/**
 * @author Xiaodong Wang
 */

public class RandomCollection<E> {
  private final NavigableMap<Double, E> random_map = new TreeMap<Double, E>();
  private double total = 0;

  public void add(double weight, E result) {
    if (weight <= 0 || random_map.containsValue(result))
      return;
    total += weight;
    random_map.put(total, result);
  }

  public E next() {
    double value = ThreadLocalRandom.current().nextDouble() * total;
    Map.Entry<Double, E> entry = random_map.ceilingEntry(value);
    if (entry != null) {
      return entry.getValue();
    } else {
      return null;
    }
  }
}
