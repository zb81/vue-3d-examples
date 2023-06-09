<script setup lang="ts">
import * as T from 'three'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import Stats from 'three/examples/jsm/libs/stats.module'
import { update as updateTween } from '@tweenjs/tween.js'
import { onMounted, onUnmounted, ref, watch } from 'vue'
import cityModel from './models/city.fbx'
import LoadingMask from '@/components/LoadingMask.vue'
import Animations from '@/utils/animation'

document.title = 'City'

const ctnRef = ref<HTMLDivElement>()
const loadedPercentage = ref(0)

/** 初始化 */
function initThree() {
  // 1.创建场景
  const scene = new T.Scene()
  scene.background = new T.Color(0x582424)
  scene.fog = new T.Fog(0xeeeeee, 0, 100)

  // 辅助坐标系，红-X, 绿-Y, 蓝-Z，右手
  const axesHelper = new T.AxesHelper(50)
  scene.add(axesHelper)

  // 2.创建相机
  const w = window.innerWidth
  const h = window.innerHeight
  // 透视相机：视场、长宽比、近面、远面
  const camera = new T.PerspectiveCamera(60, w / h, 0.1, 1000)
  camera.position.set(120, 100, 100)
  camera.lookAt(new T.Vector3(0, 0, 0))

  // 3.添加光源
  // 半球光源：创建室外效果更加自然的光源
  const cubeGeometry = new T.BoxGeometry(0.001, 0.001, 0.001)
  const cubeMaterial = new T.MeshLambertMaterial({ color: 0xffffff })
  const cube = new T.Mesh(cubeGeometry, cubeMaterial)
  const light = new T.DirectionalLight(0xb5b1c1, 1)
  light.intensity = 1.2
  light.position.set(20, 20, 5)
  light.castShadow = true
  light.target = cube
  // 调整阴影位置
  light.shadow.mapSize.width = 512 * 12
  light.shadow.mapSize.height = 512 * 12
  light.shadow.camera.top = 130
  light.shadow.camera.bottom = -80
  light.shadow.camera.left = -70
  light.shadow.camera.right = 80
  scene.add(light)
  // 环境光
  const al = new T.AmbientLight(0x605a64)
  scene.add(al)

  // 4.创建渲染器
  const renderer = new T.WebGLRenderer({ antialias: true })
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.setSize(w, h)
  renderer.shadowMap.enabled = true
  ctnRef.value!.appendChild(renderer.domElement)

  // 5.添加控制器
  const controls = new OrbitControls(camera, renderer.domElement)
  controls.target.set(0, 0, 0)
  controls.enableDamping = true

  // 6.加载模型
  const cityMeshes: T.Mesh[] = []
  const loader = new FBXLoader()
  loader.load(cityModel, (group) => {
    group.traverse((child) => {
      if (child instanceof T.Mesh) {
        // 渲染在阴影中、接收阴影
        child.castShadow = true
        child.receiveShadow = true
        cityMeshes.push(child)
        if (Array.isArray(child.material) && child.material.length > 1) {
          child.material.forEach((item: T.MeshPhongMaterial) => {
            // 设置高光颜色、高亮程度
            item.specular = item.color
            item.shininess = 50
            // 设置材质放射颜色
            if (/green|pink|cyan|black/i.test(item.name)) {
              item.emissive = item.color
            }
            // 如果材质为黑灰色，设置为不受雾面影响，同时设置放射颜色
            if (item.name.includes('DarkGray')) {
              item.emissive = new T.Color(0x000000)
              item.fog = false
            }
          })
        }
      }
    })
    // 调整位置、缩放
    group.rotation.y = Math.PI / 2
    group.position.set(40, 0, -50)
    group.scale.set(1, 1, 1)

    // TODO: 添加交互点

    // 添加到场景中
    scene.add(group)
  }, (e) => {
    const v = (loadedPercentage.value = Math.floor((e.loaded / e.total) * 100))
    if (v === 100) {
      Animations.animateCamera(camera, controls, { x: 0, y: 10, z: 20 }, { x: 0, y: 0, z: 0 }, 4000, () => {})
    }
  })

  // 7.添加状态数据
  const stats = new Stats()
  ctnRef.value!.appendChild(stats.dom)

  /** animate */
  function animate() {
    requestAnimationFrame(animate)
    renderer.render(scene, camera)
    // labelRenderer.render(scene, camera);
    stats.update()
    updateTween()
    controls.update()
  }
  animate()

  /** resize */
  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight
    camera.updateProjectionMatrix()
    renderer.setSize(window.innerWidth, window.innerHeight)
  // labelRenderer.setSize(window.innerWidth, window.innerHeight)
  }
  window.addEventListener('resize', onWindowResize)
}

onMounted(() => {
  initThree()
})
onUnmounted(() => {
  // window.removeEventListener('resize', onWindowResize)
})
</script>

<template>
  <div ref="ctnRef"></div>
  <LoadingMask
    v-if="loadedPercentage < 100"
    :percentage="loadedPercentage"
    background="#582424" color="#fff"
  />
</template>
