<template>
  <th class="col-editable resizable-th">
    <slot></slot>
    <span class="resize-handle"></span>
  </th>
</template>
<script setup lang="ts"></script>

<style lang="scss" scoped>
.col-editable {
  background-color: #d5eeff !important;
  color: #111111 !important;
}

.col-editable-child {
  background-color: #e8f6ff !important;
  color: #111111 !important;
}

.resizable-th {
  position: relative;
  user-select: none;
}

.resize-handle {
  position: absolute;
  top: 0;
  right: 0;
  width: 6px;
  height: 100%;
  cursor: col-resize;
  z-index: 10;
}

.resize-handle:hover {
  background-color: rgba(0, 0, 0, 0.15);
}

</style>
