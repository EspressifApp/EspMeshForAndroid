[[简体中文]](AliyunApis_zh_rCN.md)

# Aliyun
[[Aliyun official document]](https://living.aliyun.com/doc#demoapp.html)

# Esp Apis for Aliyun
Class [aliyun.espressif.mesh.IAliHelper](../../app/src/main/java/aliyun/espressif/mesh/IAliHelper.java)

## Integrated security picture
- The file name of the downloaded security picture is yw_1222_xxxx.jpg, please put it under the res/drawable of the project root directory (app)
- The security picture is required to be used with the signature, so please use the correct signature file

## Configuring gradle file
- Put the dependency .gradle under the project root directory (app)
- Add code above build.gradle ``apply from: 'dependency.gradle'``

## Initialize Apis
```java
AliInitialize.initAliyun(Application);
```

## Create IAliHelper instance
```java
IAliHelper helper = new AliHelper(context);
```