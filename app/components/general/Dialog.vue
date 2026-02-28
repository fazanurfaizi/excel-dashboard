<template>
  <div>
    <q-dialog v-model="dataModel.show" @hide="onHide()" transition-show="fade" transition-hide="fade" backdrop-filter="blur(3px)" :maximized="dataModel.maximize" :persistent="dataModel.persistent" full-height>
      <q-card v-if="dataModel.show" style="overflow: hidden" class="modal-card" :style="!dataModel.maximize ? `max-width: 98vw; width: ${optimizeWidth()};` : ''">
        <q-bar class="modal-bar">
          <div class="text-bold text-light">{{ dataModel.title }}</div>
          <q-space />
          <q-btn dense flat icon="minimize" @click="dataModel.maximize = false" :disable="!dataModel.maximize">
            <q-tooltip v-if="dataModel.maximize" class="bg-white text-primary">Minimize</q-tooltip>
          </q-btn>
          <q-btn dense flat icon="crop_square" @click="dataModel.maximize = true" :disable="dataModel.maximize">
            <q-tooltip v-if="!dataModel.maximize" class="bg-white text-primary">Maximize</q-tooltip>
          </q-btn>
          <q-btn dense flat icon="close" v-close-popup @click="onHide()">
            <q-tooltip class="bg-white text-primary">Close</q-tooltip>
          </q-btn>
        </q-bar>

        <q-separator />

        <q-card-section class="modal-body scroll" :style="`height: ${autoHeight}`">
          <slot></slot>
          <!-- <div class="q-py-lg"></div> -->
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { Screen } from 'quasar'
import { nextTick, ref, watch, onUnmounted } from 'vue'

interface Configs {
  [props: string]: any
  show: boolean
  type?: string
  title?: string
  width?: string
  maximize?: boolean
  persistent?: boolean
}

const emits = defineEmits(['update:modelValue', 'hide'])
const props = defineProps({
  modelValue: { type: Object as () => Configs, required: true }
  // noscroll: { type: Boolean, required: false },
})
const autoHeight = ref<string>('90vh')
let observer: ResizeObserver | null = null

const dataModel = ref(props.modelValue)
if (dataModel.value.width === undefined) dataModel.value.width = '60vw'
if (Screen.lt.sm) dataModel.value.maximize = true
else dataModel.value.maximize = dataModel.value.maximize || false
if (dataModel.value.persistent === undefined) dataModel.value.persistent = true

const optimizeWidth = () => {
  let res = dataModel.value.width
  if (Screen.lt.md) res = '95vw'
  return res
}

const onHide = () => {
  dataModel.value.show = false
  emits('hide', false)
  // emits('update:modelValue', dataModel.value)
}

const getHeight = (modalHeight: number | null = null) => {
  let height = window.innerHeight // Use window height for responsive calculation
  if (modalHeight) height = modalHeight
  else {
    const modalCard = document.querySelector('.modal-card')
    if (modalCard) height = modalCard.getBoundingClientRect().height
  }

  const modalBar = document.querySelector('.modal-bar')
  if (modalBar) height -= modalBar.getBoundingClientRect().height
  autoHeight.value = `${height}px`
}

watch(
  () => props.modelValue?.show,
  (newVal) => {
    dataModel.value = props.modelValue
    if (newVal) {
      nextTick(() => {
        const modalCard = document.querySelector('.modal-card')
        if (modalCard) {
          observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
              const height = entry.contentRect.height
              if (height) getHeight(height)
            }
          })
          observer.observe(modalCard)
        }
      })
    }
  }
)
watch(
  () => dataModel,
  (_newVal) => {
    emits('update:modelValue', dataModel.value)
  }
)

onUnmounted(() => {
  if (observer) {
    observer.disconnect()
    observer = null
    // console.log('Observer disconnected')
  }
})

watch(dataModel.value, (val) => {
  if (val) {
    history.pushState(null, '', location.href)
    window.addEventListener('popstate', onHide)
  } else {
    window.removeEventListener('popstate', onHide)
  }
})
</script>
