<template>
  <td :data-row-index="i" :class="type == 'checkbox' ? `text-center ${props.class}` : props.class">
    <form-table-input v-if="type === 'input'" :modelValue="modelValue" @update:modelValue="emitValue" />
    <form-table-number v-else-if="type === 'number'" :modelValue="modelValue" :precision="props.precision" @update:modelValue="emitValue" />
    <form-table-select v-else-if="type === 'select'" :modelValue="modelValue" :options="props.options" :optionValue="optionValue" :optionLabel="optionLabel" @update:modelValue="emitValue" />
    <q-checkbox v-else-if="type === 'checkbox'" :modelValue="modelValue" dense @update:modelValue="emitValue" />
    <slot />
  </td>
</template>

<script setup lang="ts">
const props = defineProps<{
  i: number
  class?: string
  type?: 'input' | 'number' | 'checkbox' | 'select'
  modelValue?: any
  precision?: number
  options?: any
  optionValue?: any
  optionLabel?: any
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

function emitValue(value: any) {
  emit('update:modelValue', value)
}

</script>
