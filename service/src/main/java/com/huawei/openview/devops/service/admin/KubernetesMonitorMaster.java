package com.huawei.openview.devops.service.admin;

import com.huawei.openview.devops.route.KubeResource;
import com.huawei.openview.devops.route.admin.AppBlueprintResource;
import lombok.extern.slf4j.Slf4j;

import javax.inject.Inject;
import javax.inject.Singleton;

/**
 * @author Qing Zhou
 */
@Slf4j
@Singleton
public class KubernetesMonitorMaster extends Thread{

    @Inject
    private KubeResource kubeResource;

    @Inject
    private AppBlueprintResource appBlueprintResource;

    @Inject
    private DatabaseService db;

    volatile ActionKubeSettings context = null;
    volatile boolean started = false;

    final static long SLEEP_TIME = 1000l * 60 * 10; // 10 minute

    @Override
    public void run() {
        setStarted(true);
        while (true) {
            if (context != null) {
                KubernetesMonitor slave = new KubernetesMonitor(this.db);
                slave.setKubeResource(kubeResource);
                slave.setAppBlueprintResource(appBlueprintResource);
                slave.setContext(context);
                slave.start();
                context = null;
            }

            try {
                log.debug("KubernetesMonitorMaster : sleep 10 minutes ...");
                Thread.sleep(SLEEP_TIME);
            } catch (InterruptedException e) {
                log.debug("KubernetesMonitorMaster : wake up ...");
            }
        }
    }

    public synchronized  void setContext (ActionKubeSettings context) {
        this.context = context;
    }

    public synchronized boolean isStarted() {
        return started;
    }

    public synchronized void setStarted(boolean started) {
        this.started = started;
    }
}
