<template>
  <q-input filled dense :model-value="String(modelValue)" :label="label" mask="####" readonly class="cursor-pointer" @click="openPopup">
    <template v-slot:append>
      <q-icon name="event" class="cursor-pointer">
        <q-popup-proxy ref="popupRef" transition-show="scale" transition-hide="scale" @before-show="initDate">
          <q-date v-model="internalDate" mask="YYYY" default-view="Years" emit-immediately minimal @update:model-value="onYearSelected">
            <div class="row items-center justify-end">
              <q-btn v-close-popup label="Close" color="primary" flat />
            </div>
          </q-date>
        </q-popup-proxy>
      </q-icon>
    </template>
  </q-input>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: new Date().getFullYear(),
  },
  label: {
    type: String,
    default: 'Year',
  },
})

const emit = defineEmits(['update:modelValue'])

const popupRef = ref<any>(null)
const internalDate = ref<string>('')

const openPopup = () => {
  popupRef.value?.show()
}

const initDate = () => {
  internalDate.value = String(props.modelValue)
}

const onYearSelected = (value: string) => {
  if (!value) return

  emit('update:modelValue', Number(value))

  popupRef.value?.hide()
}

watch(
  () => props.modelValue,
  (newVal) => {
    internalDate.value = String(newVal)
  }
)
</script>
