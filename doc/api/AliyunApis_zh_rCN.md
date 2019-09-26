[[English]](AliyunApis_en.md)

# Aliyun
[Aliyun 官方文档](https://living.aliyun.com/doc#demoapp.html)

# EspApis for Aliyun
类 [aliyun.espressif.mesh.IAliHelper](../../app/src/main/java/aliyun/espressif/mesh/IAliHelper.java)

## 安全图片集成
- 下载后的安全图片的文件名为 yw_1222_xxxx.jpg ,请放到工程根目录(app)的 res/drawable 下
- 安全图片是需要和签名搭配使用的，因此请使用正确的签名文件

## 配置 gradle 文件
- 将 dependency.gradle 放到工程跟目录(app)下
- 在 build.gradle 上方添加 ``apply from: 'dependency.gradle'``

## 初始化 Api
```java
AliInitialize.initAliyun(Application);
```

## 创建 IAliHelper 实例
```java
IAliHelper helper = new AliHelper(context);
```