<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@hadeshe93/lib-node](./lib-node.md) &gt; [AsyncHooksManager](./lib-node.asynchooksmanager.md)

## AsyncHooksManager class

AsyncHook 抽象管理类

   AsyncHooksManager

<b>Signature:</b>

```typescript
export declare abstract class AsyncHooksManager 
```

## Properties

|  Property | Modifiers | Type | Description |
|  --- | --- | --- | --- |
|  [customedPlugins](./lib-node.asynchooksmanager.customedplugins.md) |  | [CustomedPlugin](./lib-node.customedplugin.md)<!-- -->\[\] |  |
|  [hooks](./lib-node.asynchooksmanager.hooks.md) |  | Record&lt;string, AsyncHook&lt;any, any&gt;&gt; |  |

## Methods

|  Method | Modifiers | Description |
|  --- | --- | --- |
|  [loadPlugin(pluginFilePath, loadPluginConfigs)](./lib-node.asynchooksmanager.loadplugin.md) |  | 加载用户自定义的插件 |
|  [loadPluginFile(pluginFilePath)](./lib-node.asynchooksmanager.loadpluginfile.md) | <code>protected</code> | <p>加载插件文件，可被子类重载</p> |
|  [run(args)](./lib-node.asynchooksmanager.run.md) |  | <p>运行所有钩子</p> |

