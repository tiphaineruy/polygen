import WebAssembly from 'react-native-wasm';
// import { moduleRef } from 'react-native-wasm/react-native';
import { useState, useCallback } from 'react';
import { StyleSheet, View, Text, Button } from 'react-native';

export default function App() {
  const [module, setModule] = useState<WebAssembly.Module>();
  const [instance, setInstance] = useState<any>();

  const loadModule = useCallback(async () => {
    setModule(await WebAssembly.compile(WebAssembly.moduleRef('example')));
  }, []);

  const makeInstance = useCallback(async () => {
    setInstance(await WebAssembly.instantiate(module!));
  }, [module]);

  return (
    <View style={styles.container}>
      <Button title="Load module" onPress={loadModule} />
      <Button
        title="Create instance"
        disabled={!module}
        onPress={makeInstance}
      />
      <Text>Module Loaded: {module != null}</Text>
      <Text>Instance created: {instance != null}</Text>
      {/*<Text>Result: {result}</Text>*/}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  box: {
    width: 60,
    height: 60,
    marginVertical: 20,
  },
});
