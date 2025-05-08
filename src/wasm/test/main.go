// main.go
package main

import (
	"syscall/js"
)

func add(this js.Value, args []js.Value) interface{} {
	a := args[0].Int()
	b := args[1].Int()
	return js.ValueOf(a + b)
}

func main() {
	// 直接挂载到全局作用域
	js.Global().Set("asmGoAdd", js.FuncOf(add))

	select {} // 阻止退出
}
