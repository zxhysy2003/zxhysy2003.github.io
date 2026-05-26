# 踩坑记录(wsl端口占用问题)

### 环境

wsl2 docker desktop

### 现象

docker中启动容器时显示端口被占用，但是实际上并没有其他程序占用端口。

在powershell中输入如下指令时:
``` powershell
netsh interface ipv4 show excludedportrange protocol=tcp
```

会发现需要使用的端口被排除了。

### 原因

这些被排除的端口通常是被 Windows 的 Hyper-V 或者 WSL (Windows Subsystem for Linux) 动态预留的。因为它们每次重启时都会随机向系统申请一段端口范围。

### 解决方法

在windows中以管理员身份打开powershell，然后依次运行一下命令：
``` powershell
net stop winnat
net start winnat
```
注：也可以手动添加用户排除保留，但是怕引入其他风险，故使用上述刷新手段，代价较低。
