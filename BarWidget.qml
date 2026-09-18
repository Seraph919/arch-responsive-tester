import QtQuick
import QtQuick.Layouts
import QtQuick.Effects
import Quickshell
import Quickshell.Io
import qs.Commons
import qs.Ui

BarWidget {
  id: root

  moduleName: "seraph.arch-responsive-tester"

  readonly property string launcherPath: {
    var relPath = Qt.resolvedUrl("bin/arch-responsive-tester").toString().replace(/^file:\/\//, "")
    return relPath
  }
  readonly property string iconPath: Qt.resolvedUrl("assets/arch-responsive-tester.svg")
  property bool isRunning: false

  function launchTester(url) {
    var args = [root.launcherPath]
    if (url) args.push(url)
    Quickshell.execDetached(args)
    checkTimer.restart()
  }

  function checkRunning() {
    if (!statusProcess.running) {
      statusProcess.command = ["pgrep", "-f", "arch-responsive-tester"]
      statusProcess.running = true
    }
  }

  Timer {
    interval: 3000
    running: true
    repeat: true
    onTriggered: root.checkRunning()
  }

  Timer {
    id: checkTimer
    interval: 800
    repeat: false
    onTriggered: root.checkRunning()
  }

  Process {
    id: statusProcess
    command: []
    onExited: function(exitCode) {
      root.isRunning = (exitCode === 0)
    }
  }

  Component.onCompleted: {
    root.checkRunning()
  }

  implicitWidth: button.implicitWidth
  implicitHeight: button.implicitHeight

  BarIconButton {
    id: button
    anchors.fill: parent
    bar: root.bar
    active: root.isRunning
    activeColor: Color.accent
    tooltipText: root.isRunning
      ? "Arch Responsive Tester (Active) · Click to focus · Middle-click: Localhost:3000"
      : "Arch Responsive Tester · Phone, Tablet & Desktop Views"

    iconComponent: Component {
      Item {
        anchors.fill: parent

        Image {
          id: barIconImage
          anchors.centerIn: parent
          width: 15
          height: 15
          source: root.iconPath
          sourceSize.width: Math.round(30 * (Screen.devicePixelRatio || 1))
          sourceSize.height: Math.round(30 * (Screen.devicePixelRatio || 1))
          fillMode: Image.PreserveAspectFit
          visible: false
          layer.enabled: true
        }

        MultiEffect {
          anchors.fill: barIconImage
          source: barIconImage
          colorization: 1.0
          colorizationColor: button.active ? button.activeColor : (root.bar ? root.bar.barForeground : Color.foreground)
        }
      }
    }

    onPressed: function(mouseButton) {
      if (mouseButton === Qt.MiddleButton) {
        root.launchTester("http://localhost:3000")
        return
      }
      if (mouseButton === Qt.RightButton) {
        root.launchTester("http://localhost:5173")
        return
      }
      root.launchTester("")
    }
  }
}
