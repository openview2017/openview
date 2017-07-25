package com.huawei.openview.devops.util;

/**
 * Created by xiaodongwang on 4/17/2017.
 */
public class HttpException extends Exception {
    public int status;
    public HttpException(int status, String message) {
        super(message);
        this.status = status;
    }
    public int getStatus() {
        return status;
    }
}
