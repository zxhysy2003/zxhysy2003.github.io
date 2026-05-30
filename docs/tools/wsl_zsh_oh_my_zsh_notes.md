---
date: 2026-05-30
---

# WSL 从 Bash 切换到 Zsh，并安装 Oh My Zsh 全流程笔记

> 适用场景：Windows + WSL，想从默认 Bash 切换到 Zsh，并安装 Oh My Zsh，使用 `agnoster` 主题、右侧时间显示、`zsh-autosuggestions` 灰色命令建议等功能。

---

## 1. Bash、Zsh、Oh My Zsh 的关系

可以先这样理解：

- **Bash**：Linux/WSL 默认常见 Shell。
- **Zsh**：功能更强的 Shell，补全、提示符、插件能力更强。
- **Oh My Zsh**：Zsh 的配置框架，不是 Shell 本体。它提供主题、插件、默认配置和更方便的管理方式。

简单来说：

```text
Zsh 是终端解释器本体；Oh My Zsh 是一套现成的 Zsh 配置框架。
```

---

## 2. 安装 Zsh

在 WSL 中执行：

```bash
sudo apt update
sudo apt install -y zsh
```

检查版本：

```bash
zsh --version
```

查看 Zsh 路径：

```bash
which zsh
```

通常会输出：

```text
/usr/bin/zsh
```

---

## 3. 切换默认 Shell 为 Zsh

执行：

```bash
chsh -s $(which zsh)
```

如果没有生效，可以使用：

```bash
sudo chsh -s /usr/bin/zsh $USER
```

然后在 Windows PowerShell 中重启 WSL：

```powershell
wsl --shutdown
```

重新打开 WSL 后检查：

```bash
echo $SHELL
```

如果输出类似下面内容，说明默认 Shell 已经切换成功：

```text
/usr/bin/zsh
```

---

## 4. 不建议删除 Bash

切换到 Zsh 后，**不要删除 Bash**。

原因是很多脚本仍然依赖 Bash，例如：

```bash
#!/usr/bin/env bash
```

或者：

```bash
#!/bin/bash
```

你把默认 Shell 切换成 Zsh，不会影响这些脚本。只要脚本开头写了正确的 shebang，它们仍然会使用 Bash 执行。

也不要把 `/bin/sh` 改成 Zsh，这可能影响系统脚本。

---

## 5. 迁移 Bash 配置时要注意

Bash 常用配置文件：

```text
~/.bashrc
~/.bash_profile
~/.profile
```

Zsh 常用配置文件：

```text
~/.zshrc
~/.zprofile
~/.zshenv
```

切换到 Zsh 后，`.bashrc` 中的配置不会自动生效。

例如下面这些内容如果原来写在 `.bashrc`，需要迁移到 `.zshrc`：

```zsh
export PATH=...
alias ll='ls -al'
export JAVA_HOME=...
export MAVEN_HOME=...
export VOLTA_HOME="$HOME/.volta"
export PATH="$VOLTA_HOME/bin:$PATH"
```

建议不要直接把整个 `.bashrc` 复制到 `.zshrc`，而是只迁移必要配置。

备份原配置：

```bash
cp ~/.bashrc ~/.bashrc.backup
cp ~/.zshrc ~/.zshrc.backup 2>/dev/null || true
```

---

## 6. 解决 compinit 的 Docker 补全报错

如果切换到 Zsh 后出现：

```text
compinit:527: no such file or directory: /usr/share/zsh/vendor-completions/_docker
```

这通常表示 Zsh 补全缓存中记录了 Docker 的补全文件，但该文件不存在。

优先执行：

```zsh
rm -f ~/.zcompdump*
exec zsh
```

如果仍然报错，检查是否存在损坏的 `_docker` 补全文件或软链接：

```zsh
ls -l /usr/share/zsh/vendor-completions | grep docker
```

如果确认是损坏链接，可以删除：

```zsh
sudo rm -f /usr/share/zsh/vendor-completions/_docker
rm -f ~/.zcompdump*
exec zsh
```

如果希望重新生成 Docker 的 Zsh 补全：

```zsh
sudo mkdir -p /usr/local/share/zsh/site-functions
docker completion zsh | sudo tee /usr/local/share/zsh/site-functions/_docker > /dev/null
rm -f ~/.zcompdump*
exec zsh
```

---

## 7. 安装 Oh My Zsh 前的准备

安装依赖：

```zsh
sudo apt update
sudo apt install -y zsh git curl
```

检查：

```zsh
zsh --version
git --version
curl --version
echo $SHELL
```

建议在安装 Oh My Zsh 之前备份当前 `.zshrc`：

```zsh
mkdir -p ~/.config-backup
cp ~/.zshrc ~/.config-backup/zshrc.before-oh-my-zsh.$(date +%Y%m%d-%H%M%S) 2>/dev/null || true
```

---

## 8. 安装 Oh My Zsh

执行官方安装脚本：

```zsh
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"
```

安装完成后，重新进入 Zsh：

```zsh
exec zsh
```

安装完成后，Oh My Zsh 通常会生成新的配置文件：

```text
~/.zshrc
```

如果安装前已有 `.zshrc`，安装器通常会将其备份为：

```text
~/.zshrc.pre-oh-my-zsh
```

可以查看旧配置：

```zsh
cat ~/.zshrc.pre-oh-my-zsh
```

然后把必要的环境变量迁移回新的 `~/.zshrc`。

---

## 9. 推荐的最小插件配置

打开配置文件：

```zsh
code ~/.zshrc
```

找到：

```zsh
plugins=(git)
```

可以先改成：

```zsh
plugins=(git docker docker-compose npm mvn)
```

这些插件适合常见开发环境：

```text
git             Git 别名、分支信息、补全
docker          Docker 命令补全
docker-compose  Docker Compose 命令补全
npm             npm 相关补全
mvn             Maven 相关补全
```

修改后执行：

```zsh
source ~/.zshrc
```

---

## 10. 安装 zsh-autosuggestions 和 zsh-syntax-highlighting

这两个插件非常实用：

- `zsh-autosuggestions`：根据历史命令显示灰色建议。
- `zsh-syntax-highlighting`：输入命令时进行语法高亮。

安装：

```zsh
git clone https://github.com/zsh-users/zsh-autosuggestions \
  ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions

git clone https://github.com/zsh-users/zsh-syntax-highlighting.git \
  ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting
```

然后修改 `~/.zshrc`：

```zsh
plugins=(
  git
  docker
  docker-compose
  npm
  mvn
  zsh-autosuggestions
  zsh-syntax-highlighting
)
```

注意：`zsh-syntax-highlighting` 建议放在插件列表的最后。

重新加载配置：

```zsh
source ~/.zshrc
```

---

## 11. 配置 zsh-autosuggestions 快捷键

`zsh-autosuggestions` 是灰色历史命令建议插件。

如果想用 `Ctrl + F` 接受整条灰色建议，可以在 `~/.zshrc` 中加入：

```zsh
bindkey '^F' autosuggest-accept
```

建议放在下面这行之后：

```zsh
source $ZSH/oh-my-zsh.sh
```

完整示例：

```zsh
source $ZSH/oh-my-zsh.sh

# zsh-autosuggestions: Ctrl + F 接受整条灰色建议
bindkey '^F' autosuggest-accept
```

重新加载：

```zsh
source ~/.zshrc
```

检查是否绑定成功：

```zsh
bindkey '^F'
```

如果输出类似下面内容，说明成功：

```text
"^F" autosuggest-accept
```

如果使用 Vim 模式，即 `.zshrc` 中有：

```zsh
bindkey -v
```

则建议绑定到 `viins`：

```zsh
bindkey -M viins '^F' autosuggest-accept
```

---

## 12. 使用 agnoster 主题

在 `~/.zshrc` 中找到：

```zsh
ZSH_THEME="robbyrussell"
```

改成：

```zsh
ZSH_THEME="agnoster"
```

重新加载：

```zsh
source ~/.zshrc
```

### 注意字体问题

`agnoster` 主题会用到一些特殊符号。如果显示乱码，需要安装并配置支持 Powerline/Nerd Font 的字体。

常见选择：

```text
MesloLGS NF
FiraCode Nerd Font
CaskaydiaCove Nerd Font
JetBrainsMono Nerd Font
```

需要在 Windows Terminal 或 VSCode 终端中设置对应字体。

---

## 13. agnoster 右侧显示时间

Zsh 支持右侧提示符 `RPROMPT`。

如果希望右侧显示时间，在 `~/.zshrc` 中加入：

```zsh
RPROMPT='%F{244}%D{%H:%M}%f'
```

建议放在：

```zsh
source $ZSH/oh-my-zsh.sh
```

之后。

完整示例：

```zsh
source $ZSH/oh-my-zsh.sh

# 右侧显示时间
RPROMPT='%F{244}%D{%H:%M}%f'

# 执行命令后隐藏右侧提示符，让历史记录更干净
setopt transient_rprompt
```

说明：

```text
%D{%H:%M}  显示 24 小时制的小时和分钟
%F{244}    设置灰色前景色
%f         恢复默认颜色
```

右侧时间一般不会遮挡长命令。当输入命令过长时，Zsh 会自动隐藏或挤掉右侧提示符。

---

## 14. Conda 环境名和 agnoster 主题重复显示的问题

如果使用 Conda，可能会出现提示符中重复显示环境名，例如：

```text
(base) ~/project git:(main)
```

而 agnoster 主题本身也可能显示环境信息，导致视觉混乱。

可以关闭 Conda 自动修改提示符：

```zsh
conda config --set changeps1 false
```

然后重新打开终端。

如果希望 Conda 初始化到 Zsh，需要执行：

```zsh
conda init zsh
```

然后重启终端。

---

## 15. 推荐的 `.zshrc` 核心配置示例

下面是一份比较稳妥的核心配置示例，可按需合并到自己的 `~/.zshrc` 中：

```zsh
# Oh My Zsh path
export ZSH="$HOME/.oh-my-zsh"

# Theme
ZSH_THEME="agnoster"

# Plugins
plugins=(
  git
  docker
  docker-compose
  npm
  mvn
  zsh-autosuggestions
  zsh-syntax-highlighting
)

source $ZSH/oh-my-zsh.sh

# Right prompt: show time
RPROMPT='%F{244}%D{%H:%M}%f'
setopt transient_rprompt

# zsh-autosuggestions key binding
bindkey '^F' autosuggest-accept

# User local bin
export PATH="$HOME/.local/bin:$HOME/bin:$PATH"

# Volta, if used
export VOLTA_HOME="$HOME/.volta"
export PATH="$VOLTA_HOME/bin:$PATH"

# Common aliases
alias ll='ls -al'
alias gs='git status'
alias dc='docker compose'
```

如果你没有使用 Volta，可以删除 Volta 相关两行。

---

## 16. 安装后检查开发环境

切换完成后建议检查：

```zsh
git --version
docker --version
docker compose version
node -v
npm -v
java -version
mvn -v
python --version
conda --version
```

如果某个命令找不到，通常说明对应的环境变量没有从 `.bashrc` 迁移到 `.zshrc`。

---

## 17. VSCode 中设置默认终端为 Zsh

打开 VSCode 的 `settings.json`，可以加入：

```json
{
  "terminal.integrated.defaultProfile.linux": "zsh"
}
```

如果没有 zsh profile，可以配置：

```json
{
  "terminal.integrated.profiles.linux": {
    "zsh": {
      "path": "/usr/bin/zsh"
    }
  },
  "terminal.integrated.defaultProfile.linux": "zsh"
}
```

---

## 18. 常用排查命令

查看当前 Shell：

```zsh
echo $SHELL
```

查看当前目录：

```zsh
pwd
```

查看文件完整路径：

```zsh
realpath 文件名
```

查看当前 Zsh 配置：

```zsh
code ~/.zshrc
```

重新加载配置：

```zsh
source ~/.zshrc
```

重新启动当前 Shell：

```zsh
exec zsh
```

清除补全缓存：

```zsh
rm -f ~/.zcompdump*
exec zsh
```

查看快捷键绑定：

```zsh
bindkey
```

查看某个快捷键绑定：

```zsh
bindkey '^F'
```

查看某个快捷键对应的控制字符：

```zsh
cat -v
```

然后按下想测试的快捷键，结束时按 `Ctrl + C`。

---

## 19. 回滚方式

如果安装 Oh My Zsh 后配置混乱，可以先恢复安装前的 `.zshrc`：

```zsh
cp ~/.zshrc.pre-oh-my-zsh ~/.zshrc
exec zsh
```

如果要彻底卸载 Oh My Zsh：

```zsh
uninstall_oh_my_zsh
```

如果想把默认 Shell 改回 Bash：

```zsh
chsh -s /bin/bash
```

然后在 Windows PowerShell 中执行：

```powershell
wsl --shutdown
```

重新进入 WSL 即可。

---

## 20. 推荐安装顺序总结

最优雅的流程可以概括为：

```zsh
# 1. 安装基础依赖
sudo apt update
sudo apt install -y zsh git curl

# 2. 切换默认 shell
chsh -s $(which zsh)

# 3. 重启 WSL 后确认
echo $SHELL

# 4. 清理可能存在的补全缓存
rm -f ~/.zcompdump*
exec zsh

# 5. 备份当前 zsh 配置
mkdir -p ~/.config-backup
cp ~/.zshrc ~/.config-backup/zshrc.before-oh-my-zsh.$(date +%Y%m%d-%H%M%S) 2>/dev/null || true

# 6. 安装 Oh My Zsh
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# 7. 安装两个实用插件
git clone https://github.com/zsh-users/zsh-autosuggestions \
  ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-autosuggestions

git clone https://github.com/zsh-users/zsh-syntax-highlighting.git \
  ${ZSH_CUSTOM:-~/.oh-my-zsh/custom}/plugins/zsh-syntax-highlighting

# 8. 修改 ~/.zshrc
code ~/.zshrc

# 9. 重新加载配置
source ~/.zshrc
```

最终建议：

- 先使用少量插件，不要一次性开启太多。
- 安装 `agnoster` 后检查字体是否支持特殊符号。
- 环境变量要从 `.bashrc` 逐步迁移到 `.zshrc`。
- 遇到补全问题，优先清理 `~/.zcompdump*`。
- `zsh-autosuggestions` 推荐绑定 `Ctrl + F` 接受灰色建议。
