---
title: "Add a Custom Device Tree to the Kernel"
description: "This tutorial explains, step by step, how to add a custom Device Tree"
pubDate: 2025-09-05
categories: ["Yocto", "Embedded Linux"]   # Doit correspondre aux catégories définies
heroImage: "stm32mp.jpeg"                    # ou /uploads/cover.png
draft: false
---

# How to Add a Custom Device Tree to the Kernel  

## Introduction  
This tutorial explains, step by step, how to add a custom Device Tree (DTS) file to the Linux kernel and make sure it is used during boot.  

The **Device Tree** is a data structure that describes the hardware of a system to the Linux kernel. It allows the kernel to be built independently of the specific hardware configuration. By customizing the Device Tree, you can define additional peripherals, configure GPIOs, or enable new hardware features without modifying the kernel source code directly.  

In this tutorial, we will use the **STM32MP257F-DK** development board as an example, but the steps are applicable to other STM32MP2 boards with small adjustments.  

---

## Prerequisites  
Before you start, make sure you have the following:  

- A development PC with the [Yocto Project](https://docs.yoctoproject.org/brief-yoctoprojectqs/index.html) installed and configured.  
- An **STM32MP257F-DK** evaluation board.  
- Basic knowledge of Linux, cross-compilation, and Yocto build system.  

When customizing the kernel in Yocto, you generally avoid editing the original kernel sources directly. Instead, you create a new **meta-layer** to hold your modifications. This ensures your work is clean, modular, and easy to maintain or share.  

---

## Step 1: Create and Add a Custom Yocto Layer  

A Yocto layer is a collection of recipes and configuration files that extend or modify the build system.  

1. Create a new layer where you will store your custom files:  
   ```bash
   bitbake-layers create-layer ../../layers-external/meta-extension-stm32mp2
   ```  

2. Add this new layer to your build environment:  
   ```bash
   bitbake-layers add-layer ../../layers-external/meta-extension-stm32mp2
   ```  

3. Confirm that the new layer has been successfully added:  
   ```bash
   bitbake-layers show-layers
   ```  

   Expected output should show your new **meta-extension-stm32mp2** alongside the other existing layers:  
   ```
   layer                 path                                                                    priority
   ========================================================================================================
   core                  /home/user/yocto/poky/meta               5
   yocto                 /home/user/yocto/poky/meta-poky          5
   yoctobsp              /home/user/yocto/poky/meta-yocto-bsp     5
   openembedded-layer    /home/user/yocto/meta-openembedded/meta-oe       5
   meta-python           /home/user/yocto/meta-openembedded/meta-python   5
   stm-st-stm32mp        /home/user/yocto/meta-st-stm32mp         6
   meta-extension-stm32mp2  /home/user/yocto/layers-external/meta-extension-stm32mp2  6
   ```  

At this point, you have created a separate place where you can safely add your kernel customizations.  

---

## Step 2: Create the Custom Device Tree  

Now we will create a new Device Tree file that describes additional hardware (for example, LEDs connected to GPIOs).  

1. Inside your custom layer, create the kernel recipe folder and a file for your Device Tree:  
   ```bash
   mkdir -p meta-extension-stm32mp2/recipes-kernel/linux/files/
   cd meta-extension-stm32mp2/recipes-kernel/linux/files
   touch devicetree-extended.dts
   ```  

2. Add the following content to `devicetree-extended.dts`:  
   ```dts
   /dts-v1/;
   #include "stm32mp257f-dk.dts"

   / {
       gpio-leds {
           compatible = "gpio-leds";

           led-test {
               label = "test";
               gpios = <&gpioc 7 GPIO_ACTIVE_HIGH>;
               linux,default-trigger = "none";
               default-state = "off";
           };

           led-green {
               label = "green";
               gpios = <&gpioa 1 GPIO_ACTIVE_HIGH>;
               linux,default-trigger = "none";
               default-state = "off";
           };
       };
   };
   ```  

   ### Explanation of the code:
   - **#include "stm32mp257f-dk.dts"** ensures we inherit the default configuration of the board.  
   - The **gpio-leds** block describes two LEDs:  
     - **test** → mapped to GPIOC7  
     - **green** → mapped to GPIOA1  
   - Each LED is configured as "off" by default and with no trigger assigned (you can control them manually later).  

This demonstrates how you can extend the existing Device Tree without rewriting everything.  

---

## Step 3: Create the Kernel Recipe Extension (.bbappend)  

In Yocto, **.bbappend** files allow you to extend existing recipes without modifying them directly.  

1. Go back to the **recipes-kernel/linux/** directory and create the **.bbappend** file:  
   ```bash
   cd ../
   touch linux-stm32mp_%.bbappend
   ```  

2. Add the following content to **linux-stm32mp_%.bbappend**:  
   ```bitbake
   LICENSE = "MIT"
   LIC_FILES_CHKSUM = "file://${COMMON_LICENSE_DIR}/MIT;md5=0835ade698e0bcf8506ecda2f7b4f302"

   FILESEXTRAPATHS:prepend := "${THISDIR}/files:"
   SRC_URI += "file://devicetree-extended.dts"

   PACKAGE_ARCH = "${MACHINE_ARCH}"

   do_configure:append() {
       # For 64-bit ARM devices (STM32MP2 is arm64)
       cp ${WORKDIR}/devicetree-extended.dts ${S}/arch/arm64/boot/dts/st
       echo "dtb-\$(CONFIG_ARCH_STM32) += devicetree-extended.dtb " >> ${S}/arch/arm64/boot/dts/st/Makefile
   }
   ```  

   ### Explanation:
   - **FILESEXTRAPATHS** tells Yocto where to look for extra files (your **.dts**).  
   - **SRC_URI** adds your DTS file to the sources used during the kernel build.  
   - **do_configure:append()** copies your custom DTS into the correct kernel directory and updates the kernel Makefile to build your new `devicetree-extended.dtb`.  

---

## Step 4: Update **local.conf**  

To make sure your new Device Tree is included in the kernel build, edit **local.conf** and append your DTB:  

```bash
KERNEL_DEVICETREE += " st/devicetree-extended.dtb "
```  

This ensures that the new **devicetree-extended.dtb** will be compiled and packaged into the final image.  

---

## Step 5: Build the Image  

You are now ready to build the image with your modifications:  

```bash
bitbake core-image-minimal
```  

When the build completes, verify that your Device Tree file was integrated into the kernel sources:  

```bash
ls tmp/work-shared/stm32mp2/kernel-source/arch/arm64/boot/dts/st
```  

You should see your **devicetree-extended.dts** listed alongside the standard STM32MP2 files.  

---

## Step 6: Boot with the Custom Device Tree  

1. Flash the generated image to your STM32MP257F-DK.  

2. Interrupt U-Boot at startup by pressing any key.  

3. Display the environment variables:  
   ```bash
   STM32MP> printenv
   ```  

   You should see something like:  
   ```
   fdtfile=stm32mp257f-dk.dtb
   kernel_addr_r=0x8a000000
   fdt_addr_r=0x90000000
   ```  

   By default, `fdtfile` points to the official Device Tree (`stm32mp257f-dk.dtb`).  

4. Replace it with your custom Device Tree:  
   ```bash
   STM32MP> setenv fdtfile devicetree-extended.dtb
   STM32MP> saveenv
   ```  

5. Continue booting with your new configuration.  

---

## Step 7: Verify the Custom Device Tree in Linux  

Once Linux has booted, you can check that your custom LEDs are visible:  

```bash
ls /sys/class/leds/
```  

Expected output:  
```
blue:heartbeat  green  test
```  

- `blue:heartbeat` is the default LED.  
- `green` and `test` are the two new LEDs you added in your Device Tree.  

At this point, you have successfully integrated and tested your custom Device Tree! 🎉  

---

## References1  
- [Yocto Project Documentation](https://docs.yoctoproject.org/)  
- [STMicroelectronics STM32MPU Embedded Software](https://wiki.st.com/stm32mpu) 
- [U-BOOT](https://docs.u-boot.org/en/v2025.01/usage/index.html)

