# WSL 端口占用问题

## 环境

- WSL2
- Docker Desktop

## 现象

Docker 中启动容器时显示端口被占用，但是实际上并没有其他程序占用该端口。

在 PowerShell 中输入如下指令：

```powershell
netsh interface ipv4 show excludedportrange protocol=tcp
```

会发现需要使用的端口被排除了。

## 原因

这些被排除的端口通常是被 Windows 的 Hyper-V 或者 WSL 动态预留的。它们每次重启时都可能向系统申请一段端口范围。

## 解决方法

在 Windows 中以管理员身份打开 PowerShell，然后依次运行以下命令：

```powershell
net stop winnat
net start winnat
```

也可以手动添加用户排除保留端口，但这可能引入额外风险。对当前场景来说，刷新 `winnat` 的代价更低。

## 总结

如果 Docker 容器提示端口占用，但常规端口检查没有发现占用进程，可以先检查 Windows 的排除端口范围。确认端口被系统预留后，再通过重启 `winnat` 刷新端口分配。
