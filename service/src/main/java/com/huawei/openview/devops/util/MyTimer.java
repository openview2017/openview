package com.huawei.openview.devops.util;

import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import lombok.extern.slf4j.Slf4j;

/**
 * Created by panguobin on 3/7/17.
 */

@Getter
@Setter
@ToString
@Slf4j
public class MyTimer{
    private long startTime;
    private boolean started;
    private long currentTime;
    private long timeOut;

    public MyTimer(long timeOut) {
        this.timeOut = timeOut;
        this.started = false;
        this.startTime = System.currentTimeMillis();
        this.currentTime = System.currentTimeMillis();
    }

    public void reStart() {
        started = true;
        startTime = System.currentTimeMillis();
        currentTime = System.currentTimeMillis();
        log.debug("reStart : " + this);
    }

    public boolean isTimeOut() {
        currentTime = System.currentTimeMillis();
        boolean istimeOut = currentTime - startTime > timeOut;
        log.debug("isTimeOut : " + this + " : " + istimeOut);
        return istimeOut;
    }

    public void stop() {
        started = false;
        startTime = 0;
        currentTime = 0;
        log.debug("stop : " + this);
    }
}