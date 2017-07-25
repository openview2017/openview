# OpenView Service 
Using Java8 + Kikaha + MySQL

## Install Kikaha  
```shell
curl -s http://download.kikaha.io/installer | bash  
```

## Run

Run `kikaha run_app` to start api and change/debug code.

## How to build image

  Clone the git repo

  Create a new branch (or use a new branch other than master)

  Develop (See below on how to setup environment)

  After everything works. Commit and merge back to master branch

  Run kikaha package to package code to target/

  Push master to github. It will trigger dockerhub to build production image
